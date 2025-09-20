import React, { useState, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { 
    AppBar, Toolbar, Typography, Button, Box, IconButton, 
    Container, Paper, Grid, Card, CardContent, Link, 
    TextField, CircularProgress, MenuItem, Select, FormControl, 
    InputLabel, Avatar, BottomNavigation, BottomNavigationAction,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
    Brightness4, Brightness7, AddPhotoAlternate, Person, 
    Home, Map, Message, Add, AccountCircle
} from '@mui/icons-material';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { 
    doc, setDoc, getDoc, collection, addDoc, serverTimestamp, onSnapshot, query
} from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { auth, db } from './services/firebase';
import { uploadImage } from './services/cloudinary';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CAMPUS_CENTER, DEFAULT_ZOOM } from './services/mapbox';

// Define the dark theme with a navy blue primary color.
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1a237e', // Dark navy blue
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    secondary: {
      main: '#e5e5e5', // Light gray for contrast
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});


// Main App component
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [itemFormType, setItemFormType] = useState('found');
    const [showAddDialog, setShowAddDialog] = useState(false);

    const theme = isDarkMode ? darkTheme : createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#3f51b5',
            },
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
        },
    });

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            setCurrentPage('home');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const renderPage = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            );
        }
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'map':
                return <MapPage />;
            case 'chat':
                return <ChatPage />;
            case 'profile':
                return user ? <ProfilePage /> : <LoginPage setCurrentPage={setCurrentPage} />;
            case 'admin':
                return isAdmin ? <AdminPage /> : <HomePage />;
            case 'login':
                return <LoginPage setCurrentPage={setCurrentPage} />;
            case 'signup':
                return <SignUpPage setCurrentPage={setCurrentPage} />;
            case 'add-item':
                return <ItemForm type={itemFormType} setCurrentPage={setCurrentPage} />;
            default:
                return <HomePage />;
        }
    };

    const handleAddClick = () => {
        if (user) {
            setShowAddDialog(true);
        } else {
            setCurrentPage('login');
        }
    };

    const handleReportItem = (type) => {
        setItemFormType(type);
        setCurrentPage('add-item');
        setShowAddDialog(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: user ? 7 : 0 }}>
                <AppBar position="static" color="primary">
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="h6" component="div">
                            Campus Lost & Found
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton color="inherit" onClick={toggleTheme}>
                                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                            {isAdmin && (
                                <Button color="inherit" onClick={() => setCurrentPage('admin')}>Admin</Button>
                            )}
                            {!user ? (
                                <>
                                    <Button color="inherit" onClick={() => setCurrentPage('login')}>Login</Button>
                                    <Button color="inherit" onClick={() => setCurrentPage('signup')}>Sign Up</Button>
                                </>
                            ) : (
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                    {renderPage()}
                </Container>
                {user && (
                    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                        <BottomNavigation
                            showLabels
                            value={currentPage}
                            onChange={(event, newValue) => {
                                if (newValue !== 'add-item') {
                                    setCurrentPage(newValue);
                                }
                            }}
                            sx={{ backgroundColor: 'background.paper' }}
                        >
                            <BottomNavigationAction label="Home" value="home" icon={<Home />} />
                            <BottomNavigationAction label="Map" value="map" icon={<Map />} />
                            <BottomNavigationAction label="Add" value="add-item" icon={<Add />} onClick={handleAddClick} />
                            <BottomNavigationAction label="Chat" value="chat" icon={<Message />} />
                            <BottomNavigationAction label="Profile" value="profile" icon={<AccountCircle />} />
                        </BottomNavigation>
                    </Box>
                )}
            </Box>
            <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
                <DialogTitle>Report an Item</DialogTitle>
                <DialogContent>
                    <Typography>What would you like to report?</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-around', pb: 2 }}>
                    <Button onClick={() => handleReportItem('lost')} color="primary" variant="contained">
                        Lost Item
                    </Button>
                    <Button onClick={() => handleReportItem('found')} color="secondary" variant="contained">
                        Found Item
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

// --- Page Components ---

const HomePage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'items'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItems(itemsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" color="primary" sx={{ mb: 4, textAlign: 'center' }}>
                Lost and Found Items
            </Typography>
            <Grid container spacing={4}>
                {items.length === 0 ? (
                    <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', width: '100%', mt: 4 }}>
                        No items have been reported yet.
                    </Typography>
                ) : (
                    items.map(item => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <ItemCard item={item} />
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

const ItemCard = ({ item }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {item.imageURL && (
            <Box component="img" src={item.imageURL} alt={item.name} sx={{ width: '100%', height: 200, objectFit: 'cover' }} />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">{item.description}</Typography>
            <Box mt={2}>
                <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Category:</Box> {item.category}
                </Typography>
                <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Status:</Box> {item.type}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

const ChatPage = () => (
    <Paper sx={{ p: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>Community Chat</Typography>
        <Typography>This page will contain the real-time chat interface.</Typography>
    </Paper>
);

const MapPage = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return;
        if (!MAPBOX_TOKEN) {
            console.error("Mapbox token is not set. Please add your token to services/mapbox.js");
            return;
        }
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAPBOX_STYLE,
            center: DEFAULT_CAMPUS_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        new mapboxgl.Marker().setLngLat(DEFAULT_CAMPUS_CENTER).addTo(map.current);
    }, []);

    return (
        <Box sx={{ p: 4, height: '70vh' }}>
            <Typography variant="h4" color="primary" gutterBottom>Explore Map</Typography>
            <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: 12 }}></div>
        </Box>
    );
};

const ProfilePage = () => (
    <Paper sx={{ p: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>Profile</Typography>
        <Typography>This page will show user details and their reported items.</Typography>
    </Paper>
);

const AdminPage = () => (
    <Paper sx={{ p: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>Admin Dashboard</Typography>
        <Typography>This page is for admin moderation and case management.</Typography>
    </Paper>
);

const LoginPage = ({ setCurrentPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setCurrentPage('home');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }} component="form" onSubmit={handleLogin}>
            <Typography variant="h4" color="primary" gutterBottom>Login</Typography>
            <TextField
                label="Campus Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Login</Button>
            <Box mt={2} sx={{ textAlign: 'center' }}>
                <Link component="button" onClick={() => setCurrentPage('signup')}>
                    Don't have an account? Sign Up
                </Link>
            </Box>
        </Paper>
    );
};

const SignUpPage = ({ setCurrentPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        const campusEmailDomain = '@campus.edu';
        if (!email.endsWith(campusEmailDomain)) {
            setError("You must use a campus email to sign up.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: 'user',
                reputationScore: 0,
            });
            setCurrentPage('home');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }} component="form" onSubmit={handleSignUp}>
            <Typography variant="h4" color="primary" gutterBottom>Sign Up</Typography>
            <TextField
                label="Campus Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Sign Up</Button>
            <Box mt={2} sx={{ textAlign: 'center' }}>
                <Link component="button" onClick={() => setCurrentPage('login')}>
                    Already have an account? Login
                </Link>
            </Box>
        </Paper>
    );
};

const ItemForm = ({ type, setCurrentPage }) => {
    const [itemDetails, setItemDetails] = useState({
        name: '',
        description: '',
        category: '',
        image: null,
        claimSecret: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setItemDetails({ ...itemDetails, [name]: value });
    };

    const handleFileChange = (e) => {
        setItemDetails({ ...itemDetails, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let imageURL = '';
            if (itemDetails.image) {
                // In a real project, you would call `uploadImage` here.
                // For this example, we'll use a placeholder.
                imageURL = 'https://placehold.co/400x300';
            }

            const newItem = {
                name: itemDetails.name,
                description: itemDetails.description,
                type: type,
                category: itemDetails.category,
                imageURL: imageURL,
                claimSecret: itemDetails.claimSecret,
                status: 'active',
                reporterId: auth.currentUser.uid,
                timestamp: serverTimestamp(),
                location: null,
            };

            await addDoc(collection(db, 'items'), newItem);
            setSuccess('Item reported successfully!');
            setItemDetails({
                name: '',
                description: '',
                category: '',
                image: null,
                claimSecret: '',
            });
            setCurrentPage('home');
        } catch (err) {
            console.error("Error reporting item:", err);
            setError(err.message || "Failed to report item.");
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Electronics', 'Keys', 'Wallet', 'Bags', 'Clothing', 'Other'];

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }} component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" color="primary" gutterBottom>Report {type}</Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                    label="Category"
                    name="category"
                    value={itemDetails.category}
                    onChange={handleInputChange}
                    required
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Item Name"
                name="name"
                fullWidth
                margin="normal"
                value={itemDetails.name}
                onChange={handleInputChange}
                required
            />

            <TextField
                label="Description"
                name="description"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={itemDetails.description}
                onChange={handleInputChange}
                required
            />
            
            <TextField
                label="Claim Secret (e.g., wallet contents)"
                name="claimSecret"
                fullWidth
                margin="normal"
                value={itemDetails.claimSecret}
                onChange={handleInputChange}
                required
            />

            <Box mt={2} mb={2}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="image-upload">
                    <Button variant="contained" component="span" startIcon={<AddPhotoAlternate />}>
                        Upload Image
                    </Button>
                </label>
                {itemDetails.image && (
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                        {itemDetails.image.name}
                    </Typography>
                )}
            </Box>

            {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}

            <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
            >
                Submit Report
            </Button>
        </Paper>
    );
};

export default App;