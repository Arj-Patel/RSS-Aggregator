import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
    const [feeds, setFeeds] = useState([]);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [followedFeedIds, setFollowedFeedIds] = useState([]);
    const [followedFeedFollowIds, setFollowedFeedFollowIds] = useState({});
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    const handleFeedChange = (feedId) => {
        setSelectedFeed(feeds.find(feed => feed.id === feedId));
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setShowDropdown(true); // Show the dropdown when typing
    };

    const filteredFeeds = searchTerm ? feeds.filter(feed => feed.name.toLowerCase().startsWith(searchTerm.toLowerCase())) : feeds;

    useEffect(() => {
        axios.get('http://localhost:8080/v1/feeds')
            .then(response => {
                console.log(response.data);
                setFeeds(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        axios.get('http://localhost:8080/v1/feed_follows', {
            headers: {
                'Authorization': `ApiKey ${apiKey}`
            }
        })
            .then(response => {
                console.log(response.data);
                const feedIds = response.data.map(feedFollow => feedFollow.feed_id);
                setFollowedFeedIds(feedIds);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);



    useEffect(() => {
        if (selectedFeed) {
            axios.get(selectedFeed.url)
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    }, [selectedFeed]);

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        axios.get('http://localhost:8080/v1/feed_follows', {
            headers: {
                'Authorization': `ApiKey ${apiKey}`
            }
        })
            .then(response => {
                const feedFollows = response.data;
                const newFollowedFeedFollowIds = {};
                for (let feedFollow of feedFollows) {
                    newFollowedFeedFollowIds[feedFollow.feed_id] = feedFollow.id;
                }
                setFollowedFeedFollowIds(newFollowedFeedFollowIds);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        axios.get('http://localhost:8080/v1/posts', {
            headers: {
                'Authorization': `ApiKey ${apiKey}`
            }
        })
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    const handleFollowFeed = (feedId) => {
        if (window.confirm('Are you sure you want to follow this feed?')) {
            const apiKey = localStorage.getItem('apiKey');
            console.log(apiKey);
            axios.post('http://localhost:8080/v1/feed_follows', { feed_id: feedId }, {
                headers: {
                    'Authorization': `ApiKey ${apiKey}`
                }
            })
                .then(response => {
                    console.log(feedId);
                    setFollowedFeedIds([...followedFeedIds, feedId]);
                    setFollowedFeedFollowIds({ ...followedFeedFollowIds, [feedId]: response.data.id });

                    axios.get(`http://localhost:8080/v1/posts?feed_id=${feedId}`, {
                        headers: {
                            'Authorization': `ApiKey ${apiKey}`
                        }
                    })
                        .then(response => {
                            setPosts([...posts, ...response.data]);
                        })
                        .catch(error => {
                            console.error('There was an error!', error);
                        });
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    };

    const handleUnfollowFeed = (feedId) => {
        if (window.confirm('Are you sure you want to unfollow this feed?')) {
            const apiKey = localStorage.getItem('apiKey');
            axios.delete(`http://localhost:8080/v1/feed_follows/${followedFeedFollowIds[feedId]}`, {
                headers: {
                    'Authorization': `ApiKey ${apiKey}`
                }
            })
                .then(() => {
                    const newFollowedFeedIds = followedFeedIds.filter(id => id !== feedId);
                    setFollowedFeedIds(newFollowedFeedIds);

                    const { [feedId]: value, ...remaining } = followedFeedFollowIds;
                    setFollowedFeedFollowIds(remaining);

                    const newPosts = posts.filter(post => post.feed_id !== feedId);
                    setPosts(newPosts);
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
        navigate('/signup');
    };

    return (

        <div className="container">
            <button className="Logout-button" onClick={handleLogout}>
                Logout
            </button>
            <h1>Dashboard</h1>
            <div className="search-bar-container">
                <input type="text" placeholder="Search feeds" value={searchTerm} onChange={handleSearchChange} />
                <button onClick={() => setShowDropdown(!showDropdown)}>▼</button>
            </div>
            {showDropdown && (
                <div className="dropdown">
                    {filteredFeeds.map(feed => (
                        <div key={feed.id} className="dropdown-item">
                            <div className="feedName">
                                <span onClick={() => handleFeedChange(feed.id)}>
                                    {feed.name}
                                </span>
                            </div>
                            <div className="follow-unfollow-buttons">
                                {followedFeedIds.includes(feed.id) ? (
                                    <button className="unfollow-button" onClick={() => handleUnfollowFeed(feed.id)}>Unfollow</button>
                                ) : (
                                    <button className="follow-button" onClick={() => handleFollowFeed(feed.id)}>Follow</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="post-list">
                {posts.map(post => (
                    <div key={post.id} className="post-title">
                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                            {post.title}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}